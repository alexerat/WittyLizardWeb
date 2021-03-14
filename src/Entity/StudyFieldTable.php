<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * StudyFieldTable
 *
 * @ORM\Table(name="Users.Study_Field_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Field_ID_UNIQUE", columns={"Field_ID"})})
 * @ORM\Entity
 */
class StudyFieldTable
{
    /**
     * @var string
     *
     * @ORM\Column(name="Field_Description", type="string", length=45, nullable=true)
     */
    private $fieldDescription;

    /**
     * @var integer
     *
     * @ORM\Column(name="Field_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $fieldId;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\ManyToMany(targetEntity="App\Entity\UserTable", mappedBy="field")
     */
    private $user;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->user = new \Doctrine\Common\Collections\ArrayCollection();
    }


    /**
     * Set fieldDescription
     *
     * @param string $fieldDescription
     *
     * @return StudyFieldTable
     */
    public function setFieldDescription($fieldDescription)
    {
        $this->fieldDescription = $fieldDescription;

        return $this;
    }

    /**
     * Get fieldDescription
     *
     * @return string
     */
    public function getFieldDescription()
    {
        return $this->fieldDescription;
    }

    /**
     * Get fieldId
     *
     * @return integer
     */
    public function getFieldId()
    {
        return $this->fieldId;
    }

    /**
     * Add user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return StudyFieldTable
     */
    public function addUser(\App\Entity\UserTable $user)
    {
        $this->user[] = $user;

        return $this;
    }

    /**
     * Remove user
     *
     * @param \App\Entity\UserTable $user
     */
    public function removeUser(\App\Entity\UserTable $user)
    {
        $this->user->removeElement($user);
    }

    /**
     * Get user
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getUser()
    {
        return $this->user;
    }
}
