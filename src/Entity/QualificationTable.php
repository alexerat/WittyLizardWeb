<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QualificationTable
 *
 * @ORM\Table(name="Users.Qualification_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Qualification_ID_UNIQUE", columns={"Qualification_ID"}), @ORM\UniqueConstraint(name="Qualification_Name_UNIQUE", columns={"Qualification_Name"})}, indexes={@ORM\Index(name="fk_Qualification_Table_Qualification_Equivalence_Groups1_idx", columns={"Equivalence_ID"})})
 * @ORM\Entity
 */
class QualificationTable
{
    /**
     * @var string
     *
     * @ORM\Column(name="Qualification_Name", type="string", length=45, nullable=false)
     */
    private $qualificationName;

    /**
     * @var integer
     *
     * @ORM\Column(name="Qualification_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $qualificationId;

    /**
     * @var \App\Entity\QualificationEquivalence
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\QualificationEquivalence")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Equivalence_ID", referencedColumnName="Equivalence_ID")
     * })
     */
    private $equivalence;



    /**
     * Set qualificationName
     *
     * @param string $qualificationName
     *
     * @return QualificationTable
     */
    public function setQualificationName($qualificationName)
    {
        $this->qualificationName = $qualificationName;

        return $this;
    }

    /**
     * Get qualificationName
     *
     * @return string
     */
    public function getQualificationName()
    {
        return $this->qualificationName;
    }

    /**
     * Get qualificationId
     *
     * @return integer
     */
    public function getQualificationId()
    {
        return $this->qualificationId;
    }

    /**
     * Set equivalence
     *
     * @param \App\Entity\QualificationEquivalence $equivalence
     *
     * @return QualificationTable
     */
    public function setEquivalence(\App\Entity\QualificationEquivalence $equivalence = null)
    {
        $this->equivalence = $equivalence;

        return $this;
    }

    /**
     * Get equivalence
     *
     * @return \App\Entity\QualificationEquivalence
     */
    public function getEquivalence()
    {
        return $this->equivalence;
    }
}
