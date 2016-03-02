<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * InterestTable
 *
 * @ORM\Table(name="Users.Interest_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Interest_ID_UNIQUE", columns={"Interest_ID"})})
 * @ORM\Entity
 */
class InterestTable
{
    /**
     * @var string
     *
     * @ORM\Column(name="Interest_Desc", type="string", length=45, nullable=true)
     */
    private $interestDesc;

    /**
     * @var integer
     *
     * @ORM\Column(name="Interest_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     * @ORM\OneToMany(targetEntity="TopicInterestAssociations", mappedBy="interestId")
     */
    private $interestId;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\UserTable", mappedBy="interest")
     */
    private $user;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->user = new \Doctrine\Common\Collections\ArrayCollection();
        $this->topic = new \Doctrine\Common\Collections\ArrayCollection();
    }


    /**
     * Set interestDesc
     *
     * @param string $interestDesc
     *
     * @return InterestTable
     */
    public function setInterestDesc($interestDesc)
    {
        $this->interestDesc = $interestDesc;

        return $this;
    }

    /**
     * Get interestDesc
     *
     * @return string
     */
    public function getInterestDesc()
    {
        return $this->interestDesc;
    }

    /**
     * Get interestId
     *
     * @return integer
     */
    public function getInterestId()
    {
        return $this->interestId;
    }

    /**
     * Add user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return InterestTable
     */
    public function addUser(\AppBundle\Entity\UserTable $user)
    {
        $this->user[] = $user;

        return $this;
    }

    /**
     * Remove user
     *
     * @param \AppBundle\Entity\UserTable $user
     */
    public function removeUser(\AppBundle\Entity\UserTable $user)
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
