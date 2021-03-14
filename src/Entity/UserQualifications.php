<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * UserQualifications
 *
 * @ORM\Table(name="Users.User_Qualifications", indexes={@ORM\Index(name="fk_User_Qualifications_Qualification_Table1_idx", columns={"Qualification_ID"}), @ORM\Index(name="fk_User_Qualifications_Confirmation_Staus1_idx", columns={"Status_ID"}), @ORM\Index(name="IDX_E700E3D9C639EE63", columns={"User_ID"})})
 * @ORM\Entity
 */
class UserQualifications
{
    /**
     * @var string
     *
     * @ORM\Column(name="Document_File", type="string", length=45, nullable=true)
     */
    private $documentFile;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \App\Entity\QualificationTable
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="App\Entity\QualificationTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Qualification_ID", referencedColumnName="Qualification_ID")
     * })
     */
    private $qualification;

    /**
     * @var \App\Entity\ConfirmationStaus
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\ConfirmationStaus")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Status_ID", referencedColumnName="Status_ID")
     * })
     */
    private $status;



    /**
     * Set documentFile
     *
     * @param string $documentFile
     *
     * @return UserQualifications
     */
    public function setDocumentFile($documentFile)
    {
        $this->documentFile = $documentFile;

        return $this;
    }

    /**
     * Get documentFile
     *
     * @return string
     */
    public function getDocumentFile()
    {
        return $this->documentFile;
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return UserQualifications
     */
    public function setUser(\App\Entity\UserTable $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set qualification
     *
     * @param \App\Entity\QualificationTable $qualification
     *
     * @return UserQualifications
     */
    public function setQualification(\App\Entity\QualificationTable $qualification)
    {
        $this->qualification = $qualification;

        return $this;
    }

    /**
     * Get qualification
     *
     * @return \App\Entity\QualificationTable
     */
    public function getQualification()
    {
        return $this->qualification;
    }

    /**
     * Set status
     *
     * @param \App\Entity\ConfirmationStaus $status
     *
     * @return UserQualifications
     */
    public function setStatus(\App\Entity\ConfirmationStaus $status = null)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return \App\Entity\ConfirmationStaus
     */
    public function getStatus()
    {
        return $this->status;
    }
}
